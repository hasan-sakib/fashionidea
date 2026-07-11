"""Test helpers: register principals and create catalog data via the API."""

from fastapi.testclient import TestClient

V1 = "/api/v1"


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register_designer(
    client: TestClient, slug: str, email: str | None = None, password: str = "password123"
) -> str:
    email = email or f"designer-{slug}@example.com"
    r = client.post(
        f"{V1}/auth/register/designer",
        json={
            "email": email,
            "password": password,
            "full_name": f"Designer {slug}",
            "tenant_name": f"{slug.title()} Studio",
            "tenant_slug": slug,
        },
    )
    assert r.status_code == 201, r.text
    return r.json()["access_token"]


def register_consumer(
    client: TestClient, email: str, password: str = "password123"
) -> str:
    r = client.post(
        f"{V1}/auth/register/consumer",
        json={"email": email, "password": password, "full_name": "Shopper"},
    )
    assert r.status_code == 201, r.text
    return r.json()["access_token"]


def create_collection(client: TestClient, token: str, title="Coll", published=True) -> str:
    r = client.post(
        f"{V1}/collections/",
        headers=auth(token),
        json={"title": title, "is_published": published},
    )
    assert r.status_code == 201, r.text
    return r.json()["id"]


def create_look(
    client: TestClient,
    token: str,
    *,
    title="Look",
    collection_id: str | None = None,
    published=True,
    image_url="http://img/x.png",
    category: str | None = None,
    occasions: list[str] | None = None,
    tags: list[str] | None = None,
) -> str:
    r = client.post(
        f"{V1}/looks/",
        headers=auth(token),
        json={
            "title": title,
            "image_url": image_url,
            "collection_id": collection_id,
            "is_published": published,
            "category": category,
            "occasions": occasions or [],
            "tags": tags or [],
        },
    )
    assert r.status_code == 201, r.text
    return r.json()["id"]
