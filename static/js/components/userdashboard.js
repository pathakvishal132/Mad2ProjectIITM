const userdashboard = Vue.component("userdashboard", {
  template: `
    <div class="container">
      <h2>User Dashboard</h2>
      <!-- Check if both categories and products are loaded before rendering -->
      <div v-if="dataLoaded">
        <div v-for="category in categories" :key="category.id" class="card mb-3">
          <div class="card-header bg-primary text-white">
            <h5>{{ category.name }}</h5>
          </div>
          <div class="card-body">
            <!-- Check if there are products available for this category -->
            <div class="row">
              <div class="col-md-12 mb-3">
                <div class="card h-100">
                  <div class="card-body">
                    <h5 class="card-title">Category: {{ category.name }}</h5>
                    <!-- Iterate through products if available -->
                    <div v-for="product in category.products" :key="product.id">
                      <h6 class="card-subtitle mb-2 text-muted">{{ product.name }}</h6>
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
      </div>
      <!-- Display a loading message while data is being fetched -->
      <div v-else>
        <p>Loading...</p>
      </div>
    </div>
  `,

  data() {
    return {
      categories: [],
      dataLoaded: false, // Add a flag to track data loading
    };
  },

  methods: {
    addToCart(categoryId, productId) {
      // Create a JSON object to send as the request body
      const requestData = {
        quantity: 1, // You can adjust the quantity as needed
      };

      // Make a POST request to your API endpoint (replace with your actual API URL)
      fetch(`/api/add_to_cart/${categoryId}/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (response.ok) {
            // Successfully added to cart, you can handle the response accordingly
            return response.json();
          } else {
            // Handle the error, e.g., product quantity exceeded, etc.
            throw new Error('Failed to add to cart');
          }
        })
        .then((data) => {
          // Handle the success response here if needed
          alert(`Added to cart: ${data.message}`);
        })
        .catch((error) => {
          // Handle any errors here
          console.error('Error:', error);
          alert('Failed to add to cart.');
        });
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
      Promise.all(
        this.categories.map((category) => {
          const categoryId = category.id; // Get the category ID
          return fetch(apiUrl + `/${categoryId}`)
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error("Failed to fetch product data for category");
              }
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        })
      )
        .then((productLists) => {
          // Assign the products to the corresponding category
          this.categories.forEach((category, index) => {
            category.products = productLists[index];
          });
        })
        .catch((error) => {
          console.error("Error:", error);
        })
        .finally(() => {
          // Set the dataLoaded flag to true when all data is loaded
          this.dataLoaded = true;
        });
    },
  },

  mounted() {
    this.fetchCategories();
    document.title = "User Dashboard";
  },
});

export default userdashboard;
