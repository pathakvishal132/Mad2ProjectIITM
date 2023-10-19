const userdashboard = Vue.component("userdashboard", {
  template: `
    <div class="container">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
          <a class="navbar-brand" href="/">Green Market</a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ml-auto">
              <li class="nav-item">
                <router-link to="/" class="nav-link">Home</router-link>
              </li>
              
              <li class="nav-item">
                <router-link to="/cart" class="nav-link">Cart</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/logout" class="nav-link">Logout</router-link>
              <li class="ms-3">
        <form class="d-flex" @submit.prevent="searchAndHighlight">
          <input class="form-control me-2" type="search" v-model="searchTerm" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
      </li>
                          
            </ul>
          </div>
        </div>
      </nav>
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
                <!-- Iterate through products if available -->
                <div v-for="product in category.products" :key="product.id" class="col-md-4 mb-3">
                  <div class="card h-100">
                    <div class="card-body">
                      <h6 class="card-title">{{ product.name }}</h6>
                      <p class="card-text">Rate: ₹{{ product.rate }} / {{ product.unit.split('/')[1] }}</p>
                      <p class="card-text">Quantity: {{ product.quantity }} {{ product.unit.split('/')[1] }}</p>
                      <div class="card-footer">
                        <button v-if="product.quantity > 0" @click="addToCart(category.id, product.id)" class="btn btn-primary">Add to cart</button>
                        <span v-else class="text-danger">Out of Stock</span>
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
 style: `
    <style scoped>
  .highlight {
    background-color: yellow; 
    font-weight: bold; 
  }
</style>
  `,
  data() {
    return {
      categories: [],
      dataLoaded: false, // Add a flag to track data loading
      searchTerm: '',
    };
  },

  methods: {
    searchAndHighlight() {
      // Get the value typed in the search input
      // Remove any previous highlights
      if (this.dataLoaded) {
        this.removeHighlights();

        // Highlight the search term in the categories and products
       
        this.highlightText('.card-header h5');
        this.highlightText('.card-title');
        
      }
    },
    removeHighlights() {
      const highlightedElements = document.querySelectorAll('.highlight');
      
      highlightedElements.forEach((element) => {
        const parent = element.parentElement;
        parent.replaceChild(document.createTextNode(element.textContent), element);
      });
    },
    highlightText(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const text = element.textContent;
        const regex = new RegExp(this.searchTerm, 'gi');
        const highlightedText = text.replace(regex, (match) => {
          return `<span  style="color: red;" >${match}</span>`;
        });
       
        element.innerHTML = highlightedText;
      });
    },
    addToCart(categoryId, productId) {
      // Create a JSON object to send as the request body
      const destination = `/add_cart/${categoryId}/${productId}`;
     
      this.$router.push(destination);
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
