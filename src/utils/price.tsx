import Axios from 'axios'

export async function getPriceWithTokenAddress(
  mintAddress: string[]
) {
  
  const response = await Axios("https://price-api.sonar.watch/prices")
  const token = response.data.filter((value: { mint: string; }) => mintAddress.indexOf(value.mint) >= 0);
  return token;
}