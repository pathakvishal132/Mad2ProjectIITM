const userdashboard = Vue.component("userdashboard", {
  template: `
    <div class="container">
      <h2>User Dashboard</h2>
      <div v-for="category in categories" :key="category.id" class="card mb-3">
        <div class="card-header bg-primary text-white">
          <h5>{{ category.name }}</h5>
        </div>
        <div class="card-body">
          <!-- Nested v-for loop to iterate through products within each category -->
          <div v-for="product in category.products" :key="product.id" class="row">
            <div class="col-md-4 mb-3">
              <div class="card h-100">
                <div class="card-body">
                  <h5 class="card-title">{{ product.name }}</h5>
                  <p class="card-text">Rate: ₹{{ product.rate }} / {{ product.unit.split('/')[1] }}</p>
                  <p class="card-text">Quantity: {{ product.quantity }} {{ product.unit.split('/')[1] }}</p>
                  <div class="card-footer">
                    <button @click="addToCart(category.id, product.id)" class="btn btn-primary">Add to cart</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      categories: [], // Initialize with an empty array
    };
  },

  methods: {
    addToCart(categoryId, productId) {
      // Implement the logic to add the selected product to the cart
    },

    fetchCategories() {
      const apiUrl = "/api/category";
      fetch(apiUrl)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch category data");
          }
        })
        .then((data) => {
          this.categories = data;
          // Now that we have the categories, fetch the associated products for each category
          this.fetchProductsForCategories();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    fetchProductsForCategories() {
      const apiUrl = "/api/product";

      // Loop through categories and fetch products for each category
      this.categories.forEach((category) => {
        const categoryId = category.id; // Get the category ID
        fetch(apiUrl + `/${categoryId}`) // Use the category ID in the URL
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Failed to fetch product data for category");
            }
          })
          .then((data) => {
            // Initialize products array for each category
            category.products = data;
            console.log(data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
    },
  },

  mounted() {
    this.fetchCategories().then(() => {
      this.fetchProductsForCategories();
    });
    document.title = "User Dashboard";
  },
});

export default userdashboard;
