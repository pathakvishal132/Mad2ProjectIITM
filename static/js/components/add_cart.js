const add_cart = Vue.component("add_cart", {
  template: `
    <div>
      <div class="container">
        <h1 class="mb-4">{{ category.name }}: {{ product.name }}</h1>

        <h4 class="mb-4">Quantity: {{ product.quantity }} {{ product.unit.split('/')[1] }}</h4>
        <form method="post" action="/add_to_cart/{{ category.id }}/{{ product.id }}">
          <div class="mb-3">
            <label for="quantity" class="form-label">Quantity</label>
            <input type="number" class="form-control" v-model="quantity" id="quantity" min="0" :max="product.quantity" @input="calculateTotal">
          </div>
          <div class="mb-3">
            <label for="price" class="form-label">Price</label>
            <input type="text" class="form-control" v-model="product.rate" id="price" readonly>
          </div>
          <div class="mb-3">
            <label for="total" class="form-label">Total</label>
            <input type="text" class="form-control" id="total" v-model="total" readonly>
          </div>
          <button type="button" class="btn btn-primary" @click="addToCart">Add to Cart</button>
        </form>
      </div>
    </div>
  `,

  data() {
    return {
      category: {
        id: "{{category.id}}",
        name: "{{category.name}}", // Replace with your actual category name
      },
      product: {
        id: "{{product.id}}",
        name: "{{product.name}}", // Replace with your actual product name
        quantity: "{{product.quantity}}", // Replace with your actual product quantity
        unit: "{{product.unit}}", // Replace with your actual unit
        rate: "{{product.rate}}", // Replace with your actual rate
      },
      quantity: 0,
      total: 0,
    };
  },

  methods: {
    addToCart() {
      if (this.quantity > 0) {
        // Create a JSON object to send as the request body
        const requestData = {
          quantity: this.quantity,
        };

        // Make a POST request to the /add_to_cart/<int:category_id>/<int:product_id> endpoint
        fetch(`/add_to_cart/${this.category.id}/${this.product.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        })
          .then((response) => {
            if (response.ok) {
              // Successfully added to cart, you can handle the response accordingly
              // Redirect to the 'cart' route
              window.location.href = "/cart"; // Replace '/cart' with your actual 'cart' route
            } else {
              // Handle the error, e.g., product quantity exceeded, etc.
              throw new Error("Failed to add to cart");
            }
          })
          .then((data) => {
            // Handle the success response here if needed
            alert(`Added ${this.quantity} ${this.product.name} to the cart.`);
          })
          .catch((error) => {
            // Handle any errors here
            console.error("Error:", error);
            alert("Failed to add to cart.");
          });
      } else {
        alert("Please select a quantity greater than 0.");
      }
    },
    calculateTotal() {
      const quantity = parseInt(this.quantity);
      const price = parseFloat(this.product.rate);

      if (!isNaN(quantity) && !isNaN(price)) {
        this.total = (quantity * price).toFixed(2);
      } else {
        this.total = 0;
      }
    },
  },

  mounted() {
    document.title = "Add to Cart";
  },
});

export default add_cart;
