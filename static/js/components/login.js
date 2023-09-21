const login = Vue.component("login", {
  template: `
    <div class="container">
        <div class="login-card">
            <h1 class="text-center">Login</h1>
            <p class="text-danger">{{ error_message }}</p>
            <form @submit.prevent="loginUser">
                <div class="mb-3">
                    <label for="username" class="form-label">User/Manager Name:</label>
                    <input type="text" class="form-control" v-model="userData.name" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password:</label>
                    <input type="password" class="form-control" v-model="userData.password" required>
                </div>
                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary btn-block">Login</button>
                </div>
                <br>
                <h3 style="text-align: center;">New Account</h3>
                <div class="d-grid gap-2">
                    <router-link to="/register" class="btn btn-primary btn-block">Register</router-link>
                </div>
            </form>
        </div>
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
    loginUser() {
      const userApiUrl = "/api/user"; // URL for user data
      const managerApiUrl = "/api/manager"; // URL for manager data

      // Fetch user data
      fetch(userApiUrl)
        .then((userResponse) => {
          if (userResponse.ok) {
            return userResponse.json();
          } else {
            throw new Error("Failed to fetch user data");
          }
        })
        .then((userData) => {
          // Fetch manager data
          fetch(managerApiUrl)
            .then((managerResponse) => {
              if (managerResponse.ok) {
                return managerResponse.json();
              } else {
                throw new Error("Failed to fetch manager data");
              }
            })
            .then((managerData) => {
              // Check if the user exists in user data
              const userExists = userData.users.some(
                (user) => user.name === this.userData.name
              );

              // Check if the manager exists in manager data
              const managerExists = managerData.managers.some(
                (manager) => manager.username === this.userData.name
              );

              if (userExists) {
                // User exists, route to user dashboard
                
                this.$router.push("/userdashboard"); // Example route for user dashboard
              } else if (managerExists) {
                // Manager exists, route to manager dashboard
                this.$router.push("/manager_dashboard"); // Example route for manager dashboard
                
              } else {
                // Handle login failure (display error message)
                this.error_message = "Invalid username or password";
              }
            })
            .catch((error) => {
              // Handle network errors when fetching manager data
              this.error_message = "Network error. Please try again.";
              console.error("Error:", error);
            });
        })
        .catch((error) => {
          // Handle network errors when fetching user data
          this.error_message = "Network error. Please try again.";
          console.error("Error:", error);
        });
    },
  },

  mounted() {
    document.title = "Login";
  },
});

export default login;
