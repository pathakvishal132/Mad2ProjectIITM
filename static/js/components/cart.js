const cart = Vue.component("cart", {
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
                <router-link to="/userdashboard" class="nav-link">Dashboard</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/logout" class="nav-link">Logout</router-link>
              </li>
              
            </ul>
          </div>
        </div>
      </nav>
      <h2>Cart Items</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Updation</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, product) in cartItems" :key="product">
            <td>{{ item.product_name }}</td>
            <td>{{ item.quantity }}</td>
            <td>₹{{ item.total / item.quantity }}</td>
            <td>₹{{ item.total }}</td>
            <td>
              <form @click="deleteCartItem(item.product_name)">
                <button class="btn btn-danger delete-btn">Delete</button>
              </form>
            </td>
          </tr>
          <tr v-if="Object.keys(cartItems).length === 0">
            <td colspan="4">No items in the cart</td>
          </tr>
        </tbody>
      </table>
      <h2>Total Cost: ₹ {{ totalCost }}.0</h2>
      <form @submit.prevent="purchase">
        <button type="submit" class="btn btn-primary">Purchase</button>
      </form>
    </div>
  `,
  data() {
    return {
      cartItems: {},
      totalCost: 0,
    };
  },
  methods: {
    deleteCartItem(product_name) {
      const productNameToDelete = product_name;

  // Define the request payload as JSON
  const data = {
    product_name: productNameToDelete,
  };

  // Make the fetch request with JSON data
  fetch('/delete_cart', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json', // Set content type to JSON
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'Success') {
        // Cart item was deleted successfully
        // Use Vue.js reactivity to update this.cartItems
        this.cartItems = this.cartItems.filter(
          (item) => item.name !== productNameToDelete
        );

        // Update this.totalCost based on the updated cartItems
        
        this.$router.push("/cart");
      } else {
        // Handle the error case here
        console.error('Error:', data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    },
    purchase() {
      // Implement the logic to make a purchase
      // You may need to make an API request to your Flask server to complete the purchase
      // Update this.cartItems and this.totalCost accordingly
    },
  },
  created() {
    // Fetch cart data from your Flask route
    fetch("/cart")
      .then((response) => response.json())
      .then((data) => {
        this.cartItems = data.cart_items;
        this.totalCost = data.total_cost;
      })
      .catch((error) => {
        console.error(error);
      });
  },
  mounted() {
    document.title = "Cart";
  },
});

export default cart;
