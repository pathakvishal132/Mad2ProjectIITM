const user_register = Vue.component("user_register", {
  template: `
<div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <a class="navbar-brand" href="/">Grocery Store</a>
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
              <router-link to="/user_register" class="nav-link">User Register</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/manager_register" class="nav-link">Manager Register</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/login" class="nav-link">Login</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <h2 class="mt-3 text-center">User Registration</h2>
    <form @submit.prevent="registerUser" class="mt-4">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <div class="form-group">
            <label for="name">Username:</label>
            <input type="text" id="name" v-model="userData.name" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="userData.password" class="form-control" required />
          </div>
          <div class="form-group">
            <button type="submit" class="btn btn-primary btn-block">Register</button>
          </div>
          <div class="form-group">
            <router-link to="/login" class="nav-link active" aria-current="page">
              <button type="button" class="btn btn-primary btn-block">Login</button>
            </router-link>
          </div>
        </div>
      </div>
    </form>
  </div>
  `,

  data() {
    return {
      userData: {
        name: "",
        password: "",
      },
    };
  },

  methods: {
    async registerUser() {
      const apiUrl = "/register"; // Use the actual Flask API endpoint
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.userData.name,
            password: this.userData.password,
          }),
        });

        if (response.ok) {
          // Handle success (e.g., show a success message or redirect)
          alert("User registration successful");
          // Optionally, you can redirect the user to another page on success
          this.$router.push("/login"); // Redirect to the login page
        } else {
          // Handle errors (e.g., display error message)
          alert("User registration failed");
          console.error("Error:", response.statusText);
        }
      } catch (error) {
        // Handle network errors
        alert("Network error. Please try again.");
        console.error("Error:", error);
      }
    },
  },

  mounted() {
    document.title = "User Registration";
  },
});

export default user_register;
