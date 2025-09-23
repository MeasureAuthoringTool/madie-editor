import useTerminologyServiceApi from "../api/useTerminologyServiceApi";

const CheckLogin = async (): Promise<Boolean> => {
  const terminologyServiceApi = await useTerminologyServiceApi();
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
