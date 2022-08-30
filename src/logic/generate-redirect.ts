import {AppComponents, Network, Type} from "../types";

export async function generateRedirect(components: Pick<AppComponents, "fetch">, network: Network, type: Type, address: string): Promise<string> {
  let peer: string
  switch (network) {
    case 'mainnet': {
      peer = 'https://peer.decentraland.org'
      break
    }
    case 'goerli': {
      peer = 'https://peer.decentraland.zone'
      break
    }
    default: {
      throw new Error("Invalid network")
    }
  }

  const resp = await components.fetch.fetch(`${peer}/content/entities/profile?pointer=${address}`)
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
