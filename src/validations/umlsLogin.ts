import { useTerminologyServiceApi } from "@madie/madie-util";

const CheckLogin = async (): Promise<Boolean> => {
  const terminologyServiceApi = useTerminologyServiceApi();
  let isLoggedIn = false;
  await terminologyServiceApi
    .checkLogin()
    .then(() => {
      isLoggedIn = true;
    })
    .catch((err) => {
      isLoggedIn = false;
    });
  return isLoggedIn;
};
export default CheckLogin;
