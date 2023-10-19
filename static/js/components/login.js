const login = Vue.component("login", {
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
    <h2 class="mb-4 text-center">Login</h2>
    <form @submit.prevent="loginUser" class="mt-4">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <div class="form-group">
            <label for="username">User/Manager Name:</label>
            <input type="text" class="form-control" v-model="userData.name" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" class="form-control" v-model="userData.password" required>
          </div>
          <div class="form-group">
            <button type="submit" class="btn btn-primary btn-block">Login</button>
          </div>
          <div class="form-group">
            <router-link to="/user_register" class="nav-link active" aria-current="page">
              <button type="button" class="btn btn-primary btn-block">Register</button>
            </router-link>
          </div>
        </div>
      </div>
      <p class="text-danger text-center">{{ error_message }}</p>
    </form>
  </div>
  `,

  data() {
    return {
      userData: {
        name: "",
        password: "",
      },
      error_message: "",
    };
  },

  methods: {
    async loginUser() {
      const apiUrl = "/login"; // Use the actual Flask login API endpoint

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: this.userData.name,
            password: this.userData.password,
          }),
        });

        if (response.ok) {
          // Handle successful login (e.g., redirect to the appropriate dashboard)
          const responseData = await response.json();
          if (responseData.userType === "user") {
            // User login, route to user dashboard
            
            this.$router.push("/userdashboard");
          } else if (responseData.userType === "manager") {
            // Manager login, route to manager dashboard
            this.$router.push("/manager_dashboard");
          } else {
            // Handle other cases (e.g., display an error message)
            this.error_message = "Invalid username or password";
          }
        } else {
          // Handle login failure (e.g., display an error message)
          this.error_message = "Invalid username or password";
          console.error("Error:", response.statusText);
        }
      } catch (error) {
        // Handle network errors
        this.error_message = "Network error. Please try again.";
        console.error("Error:", error);
      }
    },
  },

  mounted() {
    document.title = "Login";
  },
});

export default login;
