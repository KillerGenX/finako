<template>
  <div id="login-container">
    <div id="login-card">
      <h1>Finako Login</h1>
      <form @submit.prevent="handleLogin">
        <div>
          <label>Email:</label>
          <input type="email" v-model="email" required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? "Loading..." : "Login" }}
        </button>
      </form>
      <p v-if="message" style="color: red;">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");
const router = useRouter();

async function handleLogin() {
  try {
    loading.value = true;
    message.value = "";
    
    // Simulasi login berhasil untuk testing
    setTimeout(() => {
      loading.value = false;
      message.value = "Login berhasil! Redirecting...";
      setTimeout(() => {
        router.push("/app");
      }, 1000);
    }, 2000);
    
  } catch (error) {
    message.value = error.message;
    loading.value = false;
  }
}
</script>

<style scoped>
#login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  padding: 20px;
}

#login-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #0056b3;
}
</style>
