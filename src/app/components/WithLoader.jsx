import Loader from "./Loader";

const WithLoader = ({ isLoading, children }) => {
  if (isLoading) {
    return <Loader />;
  }
  return <>{children}</>;
};

export default WithLoader;
