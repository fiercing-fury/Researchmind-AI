import { useState } from "react";
import API from "../services/api";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    try {

      const formData = new FormData();

      formData.append(
        "username",
        email
      );

      formData.append(
        "password",
        password
      );

      const response = await API.post(
        "/auth/login",
        formData
      );

      console.log(
        "LOGIN RESPONSE:",
        response.data
      );

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      console.log(
        "TOKEN SAVED"
      );

      alert(
        "Login Successful"
      );

      window.location.href =
        "/dashboard";

    } catch (error) {

      console.log(
        "FULL ERROR:",
        error
      );

      if (error.response) {

        console.log(
          "STATUS:",
          error.response.status
        );

        console.log(
          "DATA:",
          error.response.data
        );

      }

      alert(
        "Login Failed"
      );
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center"
      }}
    >
      <h1>
        ResearchMind AI
      </h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <br /><br />

      <button
        onClick={login}
      >
        Login
      </button>

    </div>
  );
}