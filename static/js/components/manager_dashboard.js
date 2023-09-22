const manager_dashboard = Vue.component("manager_dashboard", {
  template: `
    <div>
      <h2>Manager Dashboard</h2>
      <div class="container">
        <h2>Categories</h2>
        <!-- Input field and button for adding a new category -->
        <div>
          <input v-model="categoryName" type="text" placeholder="Enter category name" @keyup.enter="addCategory" />
          <button @click="addCategory" class="btn btn-success">Add Category</button>
        </div>
        <div v-if="dataLoaded">
          <!-- Loop through categories and display each category -->
          <div v-for="category in categories" :key="category.id" class="card mb-3">
            <div class="card-header bg-primary text-white">
              <h5>{{ category.name }}</h5>
              <!-- Buttons for editing and deleting categories -->
              <button @click="editCategory(category.id)" class="btn btn-warning">Edit</button>
              <button @click="deleteCategory(category.id)" class="btn btn-danger">Delete</button>
            </div>
            <div class="card-body">
              <h3>Products</h3>
              <!-- Form for adding a new product for this category -->
              <form @submit.prevent="addProduct(category.id)">
                <div class="form-group">
                  <label for="product_name">Product Name:</label>
                  <input v-model="productName" type="text" class="form-control" id="product_name" required>
                </div>
                <div class="form-group">
                  <label for="unit">Unit:</label>
                  <select v-model="productUnit" class="form-control" id="unit" required>
                    <option value="Rs/kg">Rs/kg</option>
                    <option value="Rs/litre">Rs/litre</option>
                    <option value="Rs/piece">Rs/piece</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="rate">Rate:</label>
                  <input v-model="productRate" type="number" class="form-control" id="rate" required>
                </div>
                <div class="form-group">
                  <label for="quantity">Quantity:</label>
                  <input v-model="productQuantity" type="number" class="form-control" id="quantity" required>
                </div>
                <button type="submit" class="btn btn-success">Add Product</button>
              </form>
              <!-- Loop through products within the category -->
              <div v-for="product in category.products" :key="product.id" class="row">
                <div class="col-md-4 mb-3">
                  <div class="card h-100">
                    <div class="card-body">
                      <h5 class="card-title">{{ product.name }}</h5>
                      <p class="card-text">Rate: ₹{{ product.rate }} / {{ product.unit.split('/')[1] }}</p>
                      <p class="card-text">Quantity: {{ product.quantity }} {{ product.unit.split('/')[1] }}</p>
                      <div class="card-footer">
                        <!-- Button to delete the product -->
                        <button @click="deleteProduct(product.id)" class="btn btn-danger">Delete</button>
                      </div>
                    </div>
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
      categories: [],
      categoryName: '',
      dataLoaded: false,
      productName: '',
      productUnit: 'Rs/kg',
      productRate: '',
      productQuantity: '',
    };
  },

  methods: {
    // Add a new category
    addCategory() {
      const data = {
        name: this.categoryName,
        maker: "1", // Replace with the actual maker ID
      };

      fetch('/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(responseData => {
          console.log('Category added:', responseData);
          this.categories.push(responseData);
          this.categoryName = '';
        })
        .catch(error => {
          console.error('Error adding category:', error);
        });
    },

    // Edit an existing category
    editCategory(categoryId) {
      // Implement logic to edit the category
      const category = this.categories.find(cat => cat.id === categoryId);
      if (!category) {
        console.error('Category not found.');
        return;
      }

      // Prompt the user for the new category name and maker
      const newName = prompt('Enter the new category name:', category.name);
      const newMaker = 1

      // Check if the user canceled the prompts
      if (newName === null || newMaker === null) {
        console.log('Edit canceled.');
        return;
      }

      // Prepare the data for the PUT request
      const data = {
        name: newName,
        maker: parseInt(newMaker),
      };

      // Send the PUT request to update the category
      fetch(`/api/category/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Network response was not ok');
          }
        })
        .then(updatedCategory => {
          console.log('Category updated successfully:', updatedCategory);
          // Update the category in the UI
          category.name = updatedCategory.name;
          category.maker = updatedCategory.maker;
        })
        .catch(error => {
          console.error('Error updating category:', error);
        });
    },

    // Delete an existing category
    deleteCategory(categoryId) {
      // Implement logic to delete the category
      const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
      if (categoryIndex === -1) {
        console.error('Category not found.');
        return;
      }

      // Confirm with the user before deleting
      if (confirm('Are you sure you want to delete this category?')) {
        // Send the DELETE request to remove the category
        fetch(`/api/category/${categoryId}`, {
          method: 'DELETE',
        })
          .then(response => {
            if (response.status === 204) {
              console.log('Category deleted successfully.');
              // Remove the category from the UI
              this.categories.splice(categoryIndex, 1);
            } else {
              throw new Error('Network response was not ok');
            }
          })
          .catch(error => {
            console.error('Error deleting category:', error);
          });
      } else {
        console.log('Deletion canceled.');
      }
    
    },

    // Add a new product for a category
    addProduct(categoryId) {
      const productData = {
        name: this.productName,
        unit: this.productUnit,
        rate: parseFloat(this.productRate),
        quantity: parseInt(this.productQuantity),
        parent: categoryId,
      };

      fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(responseData => {
          console.log('Product added:', responseData);

          // Find the category in this.categories by its ID
          const category = this.categories.find(cat => cat.id === categoryId);

          // Add the new product to the category's products array
          if (category) {
            category.products.push(responseData);
          }

          // Clear the form fields after adding the product
          this.productName = '';
          this.productUnit = 'Rs/kg';
          this.productRate = '';
          this.productQuantity = '';
        })
        .catch(error => {
          console.error('Error adding product:', error);
        });
    },

    // Delete an existing product
    deleteProduct(productId) {
      // Implement logic to delete the product
      let productCategory, productIndex;
  for (const category of this.categories) {
    const foundProductIndex = category.products.findIndex(product => product.id === productId);
    if (foundProductIndex !== -1) {
      productCategory = category;
      productIndex = foundProductIndex;
      break;
    }
  }

  if (!productCategory || productIndex === undefined) {
    console.error('Product not found.');
    return;
  }

  // Confirm with the user before deleting
  if (confirm('Are you sure you want to delete this product?')) {
    // Send the DELETE request to remove the product
    fetch(`/api/product/del/${productId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.status === 200) {
          console.log('Product deleted successfully.');
          // Remove the product from the UI
          productCategory.products.splice(productIndex, 1);
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .catch(error => {
        console.error('Error deleting product:', error);
      });
  } else {
    console.log('Deletion canceled.');
  }
    },

    // Fetch categories from the API
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

    // Fetch products for each category
    fetchProductsForCategories() {
      const apiUrl = "/api/product";

      Promise.all(
        this.categories.map((category) => {
          const categoryId = category.id;
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

  // Fetch data when the component is mounted
  mounted() {
    this.fetchCategories();
    document.title = "Manager Dashboard";
  },
});

export default manager_dashboard;
