import ServerDown from "./Serverdown";


export default function ApiWrapper({ error, children }) {
  if (error?.code === "SERVER_DOWN" || error?.code === "SERVER_ERROR") {
    return <ServerDown />;
  }

  return children;
}
