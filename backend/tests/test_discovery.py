"""Public discovery surfaces: occasion/category filters, designers, lookbooks, search.

These are the endpoints behind the public site's navbar (Discover / Designers /
Collections / Occasions / Search). Isolation rules from test_tenant_isolation.py
still apply here (only published designs from active designers surface).
"""

from tests.utils import V1, auth, create_collection, create_look, register_designer


def test_vocab_returns_occasions_and_categories(client):
    r = client.get(f"{V1}/vocab")
    assert r.status_code == 200
    body = r.json()
    assert "Wedding" in body["occasions"]
    assert "Gown" in body["categories"]


def test_discover_occasion_and_category_filters(client):
    a = register_designer(client, "alice")
    create_look(client, a, title="Wedding Gown", category="Gown", occasions=["Wedding", "Party"], published=True)
    create_look(client, a, title="Office Suit", category="Suit", occasions=["Office"], published=True)

    wedding = client.get(f"{V1}/discover/looks/?occasion=Wedding").json()
    assert {l["title"] for l in wedding["data"]} == {"Wedding Gown"}

    suits = client.get(f"{V1}/discover/looks/?category=Suit").json()
    assert {l["title"] for l in suits["data"]} == {"Office Suit"}

    none_match = client.get(f"{V1}/discover/looks/?occasion=Festival").json()
    assert none_match["data"] == []


def test_discover_text_search(client):
    a = register_designer(client, "alice")
    create_look(client, a, title="Rosewood Gown", tags=["silk", "evening"], published=True)
    create_look(client, a, title="Sand Set", tags=["linen"], published=True)

    r = client.get(f"{V1}/discover/looks/?q=Rosewood").json()
    assert {l["title"] for l in r["data"]} == {"Rosewood Gown"}


def test_look_detail_only_shows_published_designs(client):
    a = register_designer(client, "alice")
    published = create_look(client, a, title="Visible", published=True)
    draft = create_look(client, a, title="Hidden", published=False)

    ok = client.get(f"{V1}/discover/looks/{published}")
    assert ok.status_code == 200
    assert ok.json()["title"] == "Visible"

    hidden = client.get(f"{V1}/discover/looks/{draft}")
    assert hidden.status_code == 404  # unpublished designs are not a public detail page

    missing = client.get(f"{V1}/discover/looks/00000000-0000-0000-0000-000000000000")
    assert missing.status_code == 404


def test_designers_directory_only_lists_active_designers_with_published_work(client):
    a = register_designer(client, "alice")
    register_designer(client, "bob")  # no published looks yet
    create_look(client, a, published=True)
    create_look(client, a, published=False)

    r = client.get(f"{V1}/designers/").json()
    slugs = {d["slug"] for d in r["data"]}
    assert slugs == {"alice"}  # bob has zero published designs, so is excluded
    alice = next(d for d in r["data"] if d["slug"] == "alice")
    assert alice["look_count"] == 1  # only the published design counts


def test_designers_directory_search(client):
    register_designer(client, "alice")
    a2 = register_designer(client, "amara")
    create_look(client, a2, published=True)

    r = client.get(f"{V1}/designers/?q=amara").json()
    assert {d["slug"] for d in r["data"]} == {"amara"}


def test_lookbooks_only_show_published_collections_with_published_looks(client):
    a = register_designer(client, "alice")
    empty_coll = create_collection(client, a, title="Empty", published=True)
    good_coll = create_collection(client, a, title="Has designs", published=True)
    unpub_coll = create_collection(client, a, title="Draft collection", published=False)
    create_look(client, a, collection_id=good_coll, published=True)
    create_look(client, a, collection_id=unpub_coll, published=True)

    r = client.get(f"{V1}/lookbooks/").json()
    titles = {lb["title"] for lb in r["data"]}
    assert titles == {"Has designs"}  # empty and draft collections excluded
    assert empty_coll and unpub_coll  # (referenced to avoid unused warnings)


def test_search_finds_designers_designs_and_occasions(client):
    a = register_designer(client, "alice")
    create_look(client, a, title="Rosewood Gown", occasions=["Wedding"], published=True)

    r = client.get(f"{V1}/search/?q=alice").json()
    assert any(d["slug"] == "alice" for d in r["designers"])

    r2 = client.get(f"{V1}/search/?q=wedd").json()
    assert "Wedding" in r2["occasions"]

    r3 = client.get(f"{V1}/search/?q=rosewood").json()
    assert any(l["title"] == "Rosewood Gown" for l in r3["looks"])


def test_measurement_profile_round_trip(client):
    from tests.utils import register_consumer

    token = register_consumer(client, "shopper@x.com")
    r = client.patch(
        f"{V1}/auth/me",
        headers=auth(token),
        json={"measurements": {"height": "170", "bust": "88"}},
    )
    assert r.status_code == 200
    assert r.json()["measurements"] == {"height": "170", "bust": "88"}

    me = client.get(f"{V1}/auth/me", headers=auth(token)).json()
    assert me["measurements"]["height"] == "170"
