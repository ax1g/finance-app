from app.core.enums import CategoryType

DefaultCategoryDef = dict

DEFAULT_CATEGORIES: list[DefaultCategoryDef] = [
    # ── Income ──────────────────────────────────────────
    {"name": "Salary",        "type": CategoryType.INCOME,  "icon": "💼", "description": "Employment wages and salaries",         "sort_order": 10},
    {"name": "Freelance",     "type": CategoryType.INCOME,  "icon": "💻", "description": "Freelance and contract work",           "sort_order": 20},
    {"name": "Business Revenue","type": CategoryType.INCOME,"icon": "🏢", "description": "Revenue from business operations",     "sort_order": 30},
    {"name": "Investment",    "type": CategoryType.INCOME,  "icon": "📈", "description": "Dividends, capital gains, interest",   "sort_order": 40},
    {"name": "Rental Income", "type": CategoryType.INCOME,  "icon": "🏠", "description": "Property and asset rental income",     "sort_order": 50},
    {"name": "Refunds",       "type": CategoryType.INCOME,  "icon": "↩️", "description": "Refunds, rebates, returns",             "sort_order": 60},
    {"name": "Gifts",         "type": CategoryType.INCOME,  "icon": "🎁", "description": "Monetary gifts and allowances",         "sort_order": 70},
    {"name": "Other Income",  "type": CategoryType.INCOME,  "icon": "📦", "description": "Miscellaneous income",                 "sort_order": 100},
    # ── Expense ─────────────────────────────────────────
    {"name": "Housing / Rent","type": CategoryType.EXPENSE, "icon": "🏠", "description": "Rent, mortgage, property taxes",        "sort_order": 10},
    {"name": "Groceries",     "type": CategoryType.EXPENSE, "icon": "🛒", "description": "Food and household supplies",          "sort_order": 20},
    {"name": "Utilities",     "type": CategoryType.EXPENSE, "icon": "💡", "description": "Electricity, water, gas, trash",       "sort_order": 30},
    {"name": "Internet / Phone","type": CategoryType.EXPENSE,"icon":"📱", "description": "Broadband, mobile, landline",          "sort_order": 40},
    {"name": "Transportation","type": CategoryType.EXPENSE, "icon": "🚗", "description": "Fuel, parking, transit, maintenance",  "sort_order": 50},
    {"name": "Dining Out",    "type": CategoryType.EXPENSE, "icon": "🍕", "description": "Restaurants, cafes, takeout",          "sort_order": 60},
    {"name": "Entertainment", "type": CategoryType.EXPENSE, "icon": "🎬", "description": "Movies, games, hobbies, events",       "sort_order": 70},
    {"name": "Shopping",      "type": CategoryType.EXPENSE, "icon": "👕", "description": "Clothing, electronics, general goods",  "sort_order": 80},
    {"name": "Healthcare",    "type": CategoryType.EXPENSE, "icon": "🏥", "description": "Medical, dental, prescriptions",       "sort_order": 90},
    {"name": "Insurance",     "type": CategoryType.EXPENSE, "icon": "🛡️", "description": "Life, health, auto, home insurance",   "sort_order": 100},
    {"name": "Education",     "type": CategoryType.EXPENSE, "icon": "📚", "description": "Tuition, courses, books, training",    "sort_order": 110},
    {"name": "Savings / Investments","type": CategoryType.EXPENSE,"icon":"🏦", "description": "Savings deposits, investment contributions","sort_order": 120},
    {"name": "Personal Care", "type": CategoryType.EXPENSE, "icon": "🪥", "description": "Grooming, toiletries, spa",            "sort_order": 130},
    {"name": "Subscriptions", "type": CategoryType.EXPENSE, "icon": "📺", "description": "Streaming, gym, memberships",         "sort_order": 140},
    {"name": "Travel",        "type": CategoryType.EXPENSE, "icon": "✈️", "description": "Flights, hotels, vacation expenses",   "sort_order": 150},
    {"name": "Fitness",       "type": CategoryType.EXPENSE, "icon": "💪", "description": "Gym memberships, sports, wellness",    "sort_order": 160},
    {"name": "Home Maintenance","type": CategoryType.EXPENSE,"icon":"🔧", "description": "Repairs, cleaning, renovation",        "sort_order": 170},
    {"name": "Pets",          "type": CategoryType.EXPENSE, "icon": "🐾", "description": "Pet food, vet, supplies",              "sort_order": 180},
    {"name": "Gifts / Donations","type": CategoryType.EXPENSE,"icon":"🎁", "description": "Gifts, charity, tithes",              "sort_order": 190},
    {"name": "Software / Tools","type": CategoryType.EXPENSE,"icon":"💻", "description": "SaaS, licenses, developer tools",      "sort_order": 200},
    {"name": "Office Supplies","type": CategoryType.EXPENSE, "icon": "📎", "description": "Stationery, printing, consumables",   "sort_order": 210},
    {"name": "Professional Services","type": CategoryType.EXPENSE,"icon":"⚖️", "description": "Legal, accounting, consulting",   "sort_order": 220},
    {"name": "Taxes",         "type": CategoryType.EXPENSE, "icon": "📊", "description": "Income tax, property tax, fees",       "sort_order": 230},
    {"name": "Business Meals", "type": CategoryType.EXPENSE,"icon":"🍽️", "description": "Client meetings and business meals",   "sort_order": 240},
    {"name": "Other Expense", "type": CategoryType.EXPENSE, "icon": "📦", "description": "Miscellaneous expenses",              "sort_order": 300},
    # ── Adjustment ───────────────────────────────────────
    {"name": "Opening Balance", "type": CategoryType.EXPENSE, "icon": "🏦", "description": "System-generated opening balance adjustment", "sort_order": 0},
]
