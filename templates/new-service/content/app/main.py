from fastapi import FastAPI

app = FastAPI(title="${{ values.name }}")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "${{ values.name }}"}

@app.get("/")
async def root():
    return {"message": "Welcome to ${{ values.name }}"}
