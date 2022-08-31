import { AppComponents, Network, Type } from "../types";
import { IConfigComponent } from "@well-known-components/interfaces";

export async function generateRedirect(components: Pick<AppComponents, "config" | "fetch">, network: Network, type: Type, address: string): Promise<string> {
  const { config, fetch } = components

  const peer = await getPeer(config, network)

  const resp = await fetch.fetch(`${peer}/content/entities/profile?pointer=${address}`)
  if (!resp.ok) {
    throw new Error(`Could not fetch profile entity for address="${address}"`)
  } else {
    const entities = (await resp.json()) as { id?: string }[]
    if (entities.length === 0) {
      throw new Error(`No profile entity found for address="${address}"`)
    }
    const { id } = entities[0]
    if (!id) {
      throw new Error(`Invalid id found in profile entity for address="${address}"`)
    }

    return `/${network}/${type}/${address}/${id}`
  }
}

const getPeer = async (config: IConfigComponent, network: Network): Promise<string> => {
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
