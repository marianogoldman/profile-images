import {IConfigComponent} from "@well-known-components/interfaces";
import {Network} from "../types";

export const getPeer = async (config: IConfigComponent, network: Network): Promise<string> => {
  switch (network) {
    case Network.MAINNET: {
      return await config.getString("CATALYST_MAINNET") || 'https://peer.decentraland.org'
    }
    case Network.GOERLI: {
      return await config.getString("CATALYST_GOERLI") || 'https://peer.decentraland.zone'
    }
    default: {
      throw new Error("Invalid network")
    }
  }
}
