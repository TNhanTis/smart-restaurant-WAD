#!/bin/bash

# API Testing Script for Sprint 2
BASE_URL="http://localhost:3000"
SESSION_ID="test-session-$(date +%s)"

echo "==================================="
echo "🧪 Testing Sprint 2 APIs"
echo "==================================="
echo ""

# Get sample data
echo "📋 Step 1: Getting sample menu item and table..."
MENU_ITEM=$(curl -s "$BASE_URL/api/public/menu" | jq -r '.items[0] | {id, name, price}')
MENU_ITEM_ID=$(echo "$MENU_ITEM" | jq -r '.id')
MENU_ITEM_NAME=$(echo "$MENU_ITEM" | jq -r '.name')
MENU_ITEM_PRICE=$(echo "$MENU_ITEM" | jq -r '.price')

TABLE=$(curl -s "$BASE_URL/tables" | jq -r '.[0] | {id, table_number, restaurant_id}')
TABLE_ID=$(echo "$TABLE" | jq -r '.id')
TABLE_NUMBER=$(echo "$TABLE" | jq -r '.table_number')
RESTAURANT_ID=$(echo "$TABLE" | jq -r '.restaurant_id')

echo "✅ Menu Item: $MENU_ITEM_NAME (ID: $MENU_ITEM_ID, Price: $MENU_ITEM_PRICE)"
echo "✅ Table: #$TABLE_NUMBER (ID: $TABLE_ID)"
echo "✅ Restaurant ID: $RESTAURANT_ID"
echo "✅ Session ID: $SESSION_ID"
echo ""

# Test 1: Add to Cart
echo "==================================="
echo "🛒 Test 1: Add Item to Cart (POST /api/cart/items)"
echo "==================================="
ADD_TO_CART=$(curl -s -X POST "$BASE_URL/api/cart/items" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d "{
    \"menu_item_id\": \"$MENU_ITEM_ID\",
    \"quantity\": 2,
    \"special_requests\": \"Extra spicy please\"
  }")
echo "$ADD_TO_CART" | jq '.'
echo ""

# Test 2: Get Cart
echo "==================================="
echo "🛒 Test 2: Get Cart (GET /api/cart)"
echo "==================================="
CART=$(curl -s -X GET "$BASE_URL/api/cart" \
  -H "x-session-id: $SESSION_ID")
echo "$CART" | jq '.'
CART_ITEM_ID=$(echo "$CART" | jq -r '.cart_items[0].id')
echo ""

# Test 3: Update Cart Item
echo "==================================="
echo "🛒 Test 3: Update Cart Item (PATCH /api/cart/items/:id)"
echo "==================================="
UPDATE_CART=$(curl -s -X PATCH "$BASE_URL/api/cart/items/$CART_ITEM_ID" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d "{
    \"quantity\": 3
  }")
echo "$UPDATE_CART" | jq '.'
echo ""

# Test 4: Create Order with Cart Items
echo "==================================="
echo "📦 Test 4: Create Order (POST /api/orders)"
echo "==================================="
CREATE_ORDER=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d "{
    \"restaurant_id\": \"$RESTAURANT_ID\",
    \"table_id\": \"$TABLE_ID\",
    \"session_id\": \"$SESSION_ID\",
    \"special_requests\": \"Please deliver to table quickly\",
    \"items\": [
      {
        \"menu_item_id\": \"$MENU_ITEM_ID\",
        \"quantity\": 1,
        \"special_requests\": \"Medium spice\"
      }
    ]
  }")
echo "$CREATE_ORDER" | jq '.'
ORDER_ID=$(echo "$CREATE_ORDER" | jq -r '.id')
ORDER_NUMBER=$(echo "$CREATE_ORDER" | jq -r '.order_number')
echo ""

# Test 5: Verify Cart is Cleared
echo "==================================="
echo "🛒 Test 5: Verify Cart Cleared After Order (GET /api/cart)"
echo "==================================="
CART_AFTER=$(curl -s -X GET "$BASE_URL/api/cart" \
  -H "x-session-id: $SESSION_ID")
echo "$CART_AFTER" | jq '.'
echo ""

# Test 6: Get Order Status
echo "==================================="
echo "📊 Test 6: Get Order Status (GET /api/orders/:id/status)"
echo "==================================="
ORDER_STATUS=$(curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID/status")
echo "$ORDER_STATUS" | jq '.'
echo ""

# Test 7: Get Order Details
echo "==================================="
echo "📋 Test 7: Get Order Details (GET /api/orders/:id)"
echo "==================================="
ORDER_DETAILS=$(curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID")
echo "$ORDER_DETAILS" | jq '.'
echo ""

# Test 8: Add Items to Existing Order
echo "==================================="
echo "➕ Test 8: Add Items to Order (POST /api/orders/:id/add-items)"
echo "==================================="
ADD_ITEMS=$(curl -s -X POST "$BASE_URL/api/orders/$ORDER_ID/add-items" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      {
        \"menu_item_id\": \"$MENU_ITEM_ID\",
        \"quantity\": 1,
        \"special_requests\": \"No spice\"
      }
    ]
  }")
echo "$ADD_ITEMS" | jq '.'
echo ""

# Test 9: Get My Orders (Active)
echo "==================================="
echo "📜 Test 9: Get My Active Orders (GET /api/orders/my-orders)"
echo "==================================="
MY_ORDERS=$(curl -s -X GET "$BASE_URL/api/orders/my-orders")
echo "$MY_ORDERS" | jq '.'
echo ""

# Test 10: Clear Cart
echo "==================================="
echo "🗑️  Test 10: Clear Cart (DELETE /api/cart)"
echo "==================================="
CLEAR_CART=$(curl -s -X DELETE "$BASE_URL/api/cart" \
  -H "x-session-id: $SESSION_ID")
echo "$CLEAR_CART" | jq '.'
echo ""

echo "==================================="
echo "✅ All Tests Completed!"
echo "==================================="
echo "Created Order: #$ORDER_NUMBER (ID: $ORDER_ID)"
echo ""
