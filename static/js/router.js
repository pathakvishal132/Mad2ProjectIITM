import Home from "./components/home.js";
import ContactUs from "./components/contact.js";

import edit_cat from "./components/edit_cat.js";
import userdashboard from "./components/userdashboard.js";
import manager_dashboard from "./components/manager_dashboard.js";
import delete_cart from "./components/delete_cart.js";
import product from "./components/products.js";
import purchased_products from "./components/purchased_product.js";
import delete_product from "./components/delete_product.js";
import delete_category from "./components/delete_category.js";
import login from "./components/login.js";
import manager_register from "./components/manager_register.js";
import user_register from "./components/user_register.js";
import add_cart from "./components/add_cart.js";
const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/add_cart",
    component: add_cart,
  },
  
  {
    path: "/edit_cat",
    component: edit_cat,
  },
  {
    path: "/manager_register",
    component: manager_register,
  },
  {
    path: "/user_register",
    component: user_register,
  },
  {
    path: "/login",
    component: login,
  }
  ,
  {
    path: "/delete_product",
    component: delete_product,
  }
  ,
  {
    path: "/delete_category",
    component: delete_category,
  },
  {
    path: "/product",
    component: product,
  },
  
  {
    path: "/purchased_products",
    component: purchased_products,
  },
  
  {
    path: "/contact-us",
    component: ContactUs,
  },
  
  ,
  {
    path: "/delete_cart",
    component: delete_cart,
  }
  ,
  {
    path: "/userdashboard",
    component: userdashboard,
  }
  ,
  {
    path: "/manager_dashboard",
    component:manager_dashboard,
  }
  ,
  {
    path: "/edit_cat",
    component: edit_cat,
  }
  
];

const router = new VueRouter({
  routes,
});

export default router;
