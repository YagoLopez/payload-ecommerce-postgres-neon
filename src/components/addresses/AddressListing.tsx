'use client'

import React from 'react'
import { Address } from '@/payload-types'
import { AddressItem } from '@/components/addresses/AddressItem'

interface AddressListingProps {
  addresses: Address[] | null
}

export const AddressListing: React.FC<AddressListingProps> = ({ addresses }) => {
  if (!addresses || addresses.length === 0) {
    return <p>No addresses found.</p>
  }

  return (
    <div>
      <ul className="flex flex-col gap-8">
        {addresses.map((address) => (
          <li key={address.id} className="border-b pb-8 last:border-none">
            <AddressItem address={address} />
          </li>
        ))}
      </ul>
    </div>
  )
}
