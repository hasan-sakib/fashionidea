"""Multi-tenancy data-leak protection.

The core guarantee: a designer can only ever read/write their own tenant's data.
Cross-tenant access must look like the row doesn't exist (404) — never leak.
"""

from tests.utils import (
    V1,
    auth,
    create_collection,
    create_look,
    register_consumer,
    register_designer,
)


def test_designer_cannot_list_other_tenants_collections(client):
    a = register_designer(client, "alice")
    b = register_designer(client, "bob")
    create_collection(client, a, title="Alice SS26")

    assert client.get(f"{V1}/collections/", headers=auth(a)).json()["count"] == 1
    assert client.get(f"{V1}/collections/", headers=auth(b)).json()["count"] == 0


def test_designer_cannot_read_other_tenants_collection(client):
    a = register_designer(client, "alice")
    b = register_designer(client, "bob")
    cid = create_collection(client, a)

    assert client.get(f"{V1}/collections/{cid}", headers=auth(a)).status_code == 200
    # Cross-tenant read is a 404, not a 403 — existence is not leaked.
    assert client.get(f"{V1}/collections/{cid}", headers=auth(b)).status_code == 404


def test_designer_cannot_modify_or_delete_other_tenants_look(client):
    a = register_designer(client, "alice")
    b = register_designer(client, "bob")
    lid = create_look(client, a, title="Alice Look")

    assert client.patch(f"{V1}/looks/{lid}", headers=auth(b), json={"title": "hijacked"}).status_code == 404
    assert client.delete(f"{V1}/looks/{lid}", headers=auth(b)).status_code == 404
    # Untouched for the owner.
    assert client.get(f"{V1}/looks/{lid}", headers=auth(a)).json()["title"] == "Alice Look"


def test_look_cannot_reference_another_tenants_collection(client):
    a = register_designer(client, "alice")
    b = register_designer(client, "bob")
    a_coll = create_collection(client, a)

    r = client.post(
        f"{V1}/looks/",
        headers=auth(b),
        json={"title": "x", "image_url": "http://img/x.png", "collection_id": a_coll},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "collection_not_found"


def test_tenant_id_from_body_is_ignored(client):
    """A client cannot smuggle a tenant_id — it always comes from the token."""
    a = register_designer(client, "alice")
    b = register_designer(client, "bob")
    b_tenant = client.get(f"{V1}/collections/", headers=auth(b))  # ensure b exists
    assert b_tenant.status_code == 200

    # Even if we send a foreign tenant_id, the created row belongs to alice.
    r = client.post(
        f"{V1}/collections/",
        headers=auth(a),
        json={"title": "mine", "tenant_id": "00000000-0000-0000-0000-000000000000"},
    )
    assert r.status_code == 201
    # bob still sees nothing; alice owns it.
    assert client.get(f"{V1}/collections/", headers=auth(b)).json()["count"] == 0
    assert client.get(f"{V1}/collections/", headers=auth(a)).json()["count"] == 1


def test_inquiry_inbox_is_tenant_isolated(client):
    a = register_designer(client, "alice")
    b = register_designer(client, "bob")

    # Public inquiry addressed to alice via X-Tenant-ID.
    r = client.post(
        f"{V1}/inquiries/",
        headers={"X-Tenant-ID": "alice"},
        json={"sender_name": "Jane", "sender_email": "jane@x.com", "message": "Hi"},
    )
    assert r.status_code == 201

    assert client.get(f"{V1}/inquiries/", headers=auth(a)).json()["count"] == 1
    assert client.get(f"{V1}/inquiries/", headers=auth(b)).json()["count"] == 0


def test_storefront_shows_only_own_published_items(client):
    a = register_designer(client, "alice")
    register_designer(client, "bob")
    coll = create_collection(client, a, published=True)
    create_look(client, a, title="Published", collection_id=coll, published=True)
    create_look(client, a, title="Draft", collection_id=coll, published=False)

    sf = client.get(f"{V1}/storefront/", headers={"X-Tenant-ID": "alice"}).json()
    titles = [look["title"] for look in sf["looks"]]
    assert titles == ["Published"]  # draft hidden

    # Bob's storefront is empty; unknown tenant is a 400.
    assert client.get(f"{V1}/storefront/", headers={"X-Tenant-ID": "bob"}).json()["looks"] == []
    assert client.get(f"{V1}/storefront/", headers={"X-Tenant-ID": "ghost"}).status_code == 400


def test_marketplace_aggregates_published_across_tenants_only(client):
    a = register_designer(client, "alice")
    b = register_designer(client, "bob")
    create_look(client, a, title="A-pub", published=True)
    create_look(client, a, title="A-draft", published=False)
    create_look(client, b, title="B-pub", published=True)

    data = client.get(f"{V1}/marketplace/looks/").json()
    titles = {look["title"] for look in data["data"]}
    assert titles == {"A-pub", "B-pub"}  # drafts excluded, both tenants included
    slugs = {look["designer"]["slug"] for look in data["data"]}
    assert slugs == {"alice", "bob"}


def test_moodboards_are_isolated_between_consumers(client):
    a = register_designer(client, "alice")
    look = create_look(client, a, published=True)
    c1 = register_consumer(client, "c1@x.com")
    c2 = register_consumer(client, "c2@x.com")

    board = client.post(f"{V1}/moodboards/", headers=auth(c1), json={"name": "Faves"}).json()
    client.post(f"{V1}/moodboards/{board['id']}/items", headers=auth(c1), json={"look_id": look})

    # c2 cannot see or touch c1's board.
    assert client.get(f"{V1}/moodboards/", headers=auth(c2)).json() == []
    assert client.get(f"{V1}/moodboards/{board['id']}", headers=auth(c2)).status_code == 404
    assert client.delete(f"{V1}/moodboards/{board['id']}", headers=auth(c2)).status_code == 404
