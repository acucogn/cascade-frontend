import React from "react";
import GoogleButton from "react-google-button";

export default function LoginButton() {
  const handleLogin = () => {
    // Let the browser handle the whole redirect chain
    window.location.href = "https://cunning-model-puma.ngrok-free.app/auth/login";
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", marginTop:80 }}>
      <GoogleButton onClick={handleLogin}/>
    </div>
  );
}
