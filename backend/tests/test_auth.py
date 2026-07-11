"""Authentication, registration, and route guards."""

from tests.utils import V1, auth, register_consumer, register_designer


def test_health_check(client):
    r = client.get(f"{V1}/utils/health-check/")
    assert r.status_code == 200 and r.json() == {"status": "ok"}


def test_designer_registration_and_me(client):
    token = register_designer(client, "alice")
    me = client.get(f"{V1}/auth/me", headers=auth(token)).json()
    assert me["role"] == "designer"
    assert me["tenant_id"] is not None


def test_consumer_registration_is_tenantless(client):
    token = register_consumer(client, "c@x.com")
    me = client.get(f"{V1}/auth/me", headers=auth(token)).json()
    assert me["role"] == "consumer"
    assert me["tenant_id"] is None


def test_duplicate_slug_and_reserved_slug_rejected(client):
    register_designer(client, "alice")
    dup = client.post(
        f"{V1}/auth/register/designer",
        json={"email": "x@x.com", "password": "password123", "tenant_name": "X", "tenant_slug": "alice"},
    )
    assert dup.status_code == 400 and dup.json()["detail"] == "slug_taken"

    reserved = client.post(
        f"{V1}/auth/register/designer",
        json={"email": "y@x.com", "password": "password123", "tenant_name": "Y", "tenant_slug": "api"},
    )
    assert reserved.status_code == 400 and reserved.json()["detail"] == "slug_reserved"


def test_designer_login_requires_tenant_context(client):
    register_designer(client, "alice", email="a@studio.com")

    # Without tenant context, the designer is not found in the tenant-less scope.
    no_ctx = client.post(
        f"{V1}/auth/login", data={"username": "a@studio.com", "password": "password123"}
    )
    assert no_ctx.status_code == 401

    with_ctx = client.post(
        f"{V1}/auth/login",
        data={"username": "a@studio.com", "password": "password123"},
        headers={"X-Tenant-ID": "alice"},
    )
    assert with_ctx.status_code == 200 and "access_token" in with_ctx.json()


def test_same_email_allowed_across_tenants(client):
    register_designer(client, "one", email="shared@x.com")
    # Same email in a different tenant is allowed (tenant-scoped uniqueness).
    r = client.post(
        f"{V1}/auth/register/designer",
        json={"email": "shared@x.com", "password": "password123", "tenant_name": "Two", "tenant_slug": "two"},
    )
    assert r.status_code == 201


def test_guards(client):
    # No token → 401.
    assert client.get(f"{V1}/collections/").status_code == 401
    # Consumer token → 403 on designer routes.
    consumer = register_consumer(client, "c@x.com")
    assert client.get(f"{V1}/collections/", headers=auth(consumer)).status_code == 403
    # Tampered token → 401.
    assert client.get(f"{V1}/auth/me", headers=auth("not.a.token")).status_code == 401


def test_profile_update(client):
    token = register_consumer(client, "c@x.com")
    r = client.patch(f"{V1}/auth/me", headers=auth(token), json={"full_name": "New Name"})
    assert r.status_code == 200 and r.json()["full_name"] == "New Name"
    assert client.get(f"{V1}/auth/me", headers=auth(token)).json()["full_name"] == "New Name"
