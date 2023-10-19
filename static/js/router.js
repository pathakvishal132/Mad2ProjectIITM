import Home from "./components/home.js";
import ContactUs from "./components/contact.js";
import logout from "./components/logout.js";
import cart from "./components/cart.js";
import userdashboard from "./components/userdashboard.js";
import manager_dashboard from "./components/manager_dashboard.js";



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
    path: "/add_cart/:category_id/:product_id",
    name: "add_cart",
    component: add_cart,
    props: true,
  },
  {
    path: "/logout",
    component: logout,
  },
  
  {
    path: "/cart",
    component: cart,
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
    path: "/contact-us",
    component: ContactUs,
  },
  
  
  
  {
    path: "/userdashboard",
    component: userdashboard,
  }
  ,
  {
    path: '/manager_dashboard',
    component:manager_dashboard,
  }
  
  
  
];

const router = new VueRouter({
  routes,
});

export default router;
