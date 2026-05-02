
---

## **USER Endpoints**

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/auth/login` | POST | Authenticate a user and retrieve a token | Login with registered email and password |
| `/auth/register` | GET | Register a new user | Open the registration form or endpoint |

---

## **CATEGORY Endpoints**

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/category` | POST | Create a new category | Include category name, subcategories, and an image |
| `/category` | GET | Retrieve all categories | List of all categories |
| `/category/:id` | GET | Retrieve details of a single category | Fetch category by its ID |
| `/category/:id` | PUT | Update a category by ID | Change subcategories or other properties |

> Replace `:id` with the actual category UUID.

---

## **BRAND Endpoints**

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/brand` | POST | Create a new brand | Include brand name, description, and image |
| `/brand/:id` | PATCH | Update brand image | Upload a new brand image |
| `/brand/:id` | PATCH | Edit brand data | Update brand information such as description |
| `/brand` | GET | Retrieve all brands | List of all brands |
| `/brand/:id` | GET | Retrieve a single brand by ID | Fetch brand details by ID |

> Replace `:id` with the actual brand UUID.

---

## **PRODUCT Endpoints**

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/products` | POST | Create a new product | Include product details, images, category and brand references |
| `/products` | GET | Retrieve all products | List of all products |
| `/products/:id` | GET | Retrieve a single product by ID | Fetch product details by its ID |

> Replace `:id` with the actual product UUID.

---

## **SPECIAL OFFER Endpoints**

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/special-offer` | GET | Create or retrieve special offers | Fetch all current offers or create a new one |

---

## Notes

- Replace `:id` in endpoints with the actual UUID of the resource.
- File uploads must be sent as **form-data**.
- Use the **Postman collection** for testing requests quickly.
- Responses are returned in **JSON format**, including success/failure messages.

---

## Example Usage

### Login
- **Description:** Authenticate a user.
- **Example:** Send POST request to `/auth/login` with email and password. You will receive an authentication token.

### Create Category
- **Description:** Add a new category with optional subcategories and an image.
- **Example:** Send POST request to `/category` with category name, subcategories, and file upload.

### Create Product
- **Description:** Add a new product with details, images, category, and brand references.
- **Example:** Send POST request to `/products` with product information and multiple images.

### Update Brand Image
- **Description:** Update the image for a brand.
- **Example:** Send PATCH request to `/brand/:id` with new image file.

### Get All Products
- **Description:** Retrieve all available products.
- **Example:** Send GET request to `/products` to fetch a list of all products.

---

This version is **clean, readable, and professional** for GitHub — no raw JSON is included, only clear descriptions and examples.  

---

I can also make an **even cleaner GitHub version with collapsible sections for each resource** so it looks like official documentation.  

Do you want me to do that next?
