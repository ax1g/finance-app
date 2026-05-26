import asyncio
import random
from faker import Faker
from backend.app.transactions.model import Transaction

# Import your async session maker from wherever you define your DB connection
from app.core.db import AsyncSessionLocal

fake = Faker()


async def seed_db(num_records: int = 500):
    async with AsyncSessionLocal() as session:
        print(f"Generating {num_records} dummy transactions...")

        dummy_data = []
        for _ in range(num_records):
            txn = Transaction(
                # Generate a random date between 1 year ago and today
                txn_date=fake.date_time_between(start_date="-1y", end_date="now"),
                txn_type=random.choice(["income", "expense"]),
                category_id=random.choice(range(1,5)),
                amount=round(random.uniform(100.0, 10000.0), 2),
                account_id=random.choice(range(1,5)),
                description=fake.catch_phrase(),
            )
            dummy_data.append(txn)

        # SQLAlchemy can insert the whole list in one efficient query
        session.add_all(dummy_data)
        await session.commit()

        print("Seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_db())
