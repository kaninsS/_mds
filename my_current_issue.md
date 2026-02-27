## My issue

- I want to separate user product item view in customer-product with sales-channel that medusaJs provided

### Step to reproduce

1. **Create vendor**
   - (Goto `/backend/` then run this command `./scripts/create_test_vendor.sh` then cli will provide you email and password)
   - (when you create vendor, backend will trigger and create sales-channel for that vendor)

2. **Login vendor**
   - (Goto <http://localhost:3000/>)

3. **Register new customer for this vendor**
   - (Goto <http://localhost:3000/customers> -> Click "Genarate invite link" button -> Copy link and paste to new tab -> Register new customer -> [*Expected: Customer should show in customer list*])

4. **Create new product for this vendor**
   - (Goto <http://localhost:3000/products> -> Click "Create Product" button -> Fill in the form -> Save -> [*Expected: 1. Product should show in product list 2. Product should show in sale-channel on admin side* <http://localhost:9000/app/settings/sales-channels/>] -> click that specific sales-channel(product will show in product list))]

5. **Login customer**
   - (Goto <http://localhost:8000/dk/store>)

6. **View product**
   - (Goto <http://localhost:8000/dk/store> -> [*Expected: Product should show in product list*])

### Issue on step#6

- Product is not visible in customer store (Need to add default sales-channel to the specific product but this will not separate the product view for each vendor)
- Customer should only see their own product that created by their vendor (same product list as in their channel)
- I already rollback before I try implement
  1. Custom Product Module in back end /store this end up me with lost basic medusa behaviors ,Inventory, Product-Attributes, Product-Organize, Customer page
  2. I try to create new endpoint in customer-store call something like /store/vendor-product/<sales-channel-id> then this will allow me to show diffence product for each vendor but this will not allow me to use medusa built-in product features (Order, Cart, Payment)
