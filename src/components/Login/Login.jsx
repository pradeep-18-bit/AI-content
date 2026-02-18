import LeftPanel from "./LeftPanel";
import LoginForm from "./LoginForm";
import "../styles.css";

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-container">
        <LeftPanel />
        <LoginForm />
      </div>
    </div>
  );
}
