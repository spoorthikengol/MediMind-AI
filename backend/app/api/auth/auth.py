from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Temporary in-memory "users"
fake_users = []

@router.post("/register")
def register(user: dict):
    fake_users.append(user)
    return {"message": "User registered successfully", "user": user}


@router.post("/login")
def login(user: dict):
    for u in fake_users:
        if u["email"] == user["email"] and u["password"] == user["password"]:
            return {"message": "Login successful"}
    return {"message": "Invalid credentials"}