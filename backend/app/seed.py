import asyncio
import random
from faker import Faker
from app.transactions.models import Transaction

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
                category=fake.catch_phrase(),
                # Assuming you have an amount and description/title field
                amount=round(random.uniform(5.0, 5000.0), 2),
                account=random.choice(["cash", "bank", "esewa"]),
                description=fake.catch_phrase(),
                # If you have status fields, you can randomize them too:
                # status=random.choice(["pending", "completed", "failed"])
            )
            dummy_data.append(txn)

        # SQLAlchemy can insert the whole list in one efficient query
        session.add_all(dummy_data)
        await session.commit()

        print("Seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_db())
