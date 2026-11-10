# Adding products to the catalog

Upload each product image into `assets/products/`, then add an item to `products.json` using this structure:

```json
{
  "id": "unique-product-id",
  "category": "hobby",
  "code": "SKU 001",
  "name": "Product name",
  "description": "Short product description.",
  "image": "assets/products/product-image.jpg",
  "imageAlt": "Clear description of the product image",
  "price": 5000,
  "currency": "JPY"
}
```

Valid categories are `hobby`, `matcha`, `japanese-knives`, and `lamb`. Products appear automatically in the matching section. If a category has no products, three reserved product spaces are shown. The order basket activates as soon as a product is added.
