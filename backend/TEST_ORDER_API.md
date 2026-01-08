# Test Order Creation API

This document contains sample requests for testing the Order Creation API endpoint.

## Prerequisites

Before testing, ensure:

1. The migration `003_create_order_tables.sql` has been applied to the database
2. The server is running (`npm run start:dev`)
3. Test data exists:
   - At least one active table
   - At least one available menu item
   - Optional: Active modifier options

## Sample Request

### POST /api/orders

**Endpoint:** `http://localhost:3000/api/orders`

**Method:** POST

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body (Simple Order - No Modifiers):**

```json
{
  "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "table_id": "REPLACE_WITH_ACTUAL_TABLE_ID",
  "customer_id": "OPTIONAL_CUSTOMER_ID",
  "special_requests": "No onions please",
  "items": [
    {
      "menu_item_id": "REPLACE_WITH_ACTUAL_MENU_ITEM_ID",
      "quantity": 2,
      "special_requests": "Extra spicy"
    }
  ]
}
```

**Request Body (Order with Modifiers):**

```json
{
  "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "table_id": "REPLACE_WITH_ACTUAL_TABLE_ID",
  "items": [
    {
      "menu_item_id": "REPLACE_WITH_ACTUAL_MENU_ITEM_ID",
      "quantity": 1,
      "special_requests": "Well done",
      "modifiers": [
        {
          "modifier_option_id": "REPLACE_WITH_ACTUAL_MODIFIER_ID"
        }
      ]
    },
    {
      "menu_item_id": "REPLACE_WITH_ANOTHER_MENU_ITEM_ID",
      "quantity": 2
    }
  ]
}
```

## Expected Response

**Status:** 201 Created

**Response Body:**

```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "table_id": "uuid",
  "customer_id": "uuid or null",
  "order_number": "ORD-20260107-1234",
  "status": "pending",
  "subtotal": "50.00",
  "tax": "5.00",
  "total": "55.00",
  "special_requests": "No onions please",
  "created_at": "2026-01-07T...",
  "updated_at": "2026-01-07T...",
  "accepted_at": null,
  "preparing_at": null,
  "ready_at": null,
  "served_at": null,
  "completed_at": null,
  "table": {
    "id": "uuid",
    "table_number": "T-001",
    "location": "Main Hall"
  },
  "order_items": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "menu_item_id": "uuid",
      "quantity": 2,
      "unit_price": "25.00",
      "subtotal": "50.00",
      "special_requests": "Extra spicy",
      "created_at": "2026-01-07T...",
      "menu_item": {
        "id": "uuid",
        "name": "Phở Bò",
        "description": "Traditional Vietnamese beef noodle soup",
        "price": "25.00"
      },
      "modifiers": []
    }
  ]
}
```

## Error Responses

### Table Not Found

**Status:** 404

```json
{
  "statusCode": 404,
  "message": "Table with ID xxx not found"
}
```

### Menu Item Not Found

**Status:** 400

```json
{
  "statusCode": 400,
  "message": "One or more menu items not found"
}
```

### Menu Item Unavailable

**Status:** 400

```json
{
  "statusCode": 400,
  "message": "Menu items are unavailable: Item Name 1, Item Name 2"
}
```

### Validation Error

**Status:** 400

```json
{
  "statusCode": 400,
  "message": ["items must contain at least one item"],
  "error": "Bad Request"
}
```

## Testing Steps

1. **Get Test Data IDs:**

   ```bash
   # Get table ID
   curl http://localhost:3000/api/admin/tables

   # Get menu item IDs
   curl http://localhost:3000/api/admin/menu/items

   # Get modifier option IDs (if needed)
   curl http://localhost:3000/api/admin/modifier-groups
   ```

2. **Create Order:**
   Replace the placeholder IDs in the request body and send the POST request.

3. **Verify Order:**
   ```bash
   # Get order details
   curl http://localhost:3000/api/orders/{order_id}
   ```

## Calculation Logic

- **Item Subtotal** = (unit_price + sum of modifier price adjustments) × quantity
- **Order Subtotal** = sum of all item subtotals
- **Tax** = subtotal × 0.10 (10%)
- **Total** = subtotal + tax

## Order Number Format

Format: `ORD-YYYYMMDD-XXXX`

- YYYYMMDD: Current date
- XXXX: Random 4-digit number (1000-9999)

Example: `ORD-20260107-1234`
