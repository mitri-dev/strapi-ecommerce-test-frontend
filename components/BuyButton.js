import { useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js'

import styles from '../styles/BuyButton.module.css';
import AuthContext from '../context/AuthContext'
import { STRIPE_PK, API_URL } from '../utils/urls'

const stripePromise = loadStripe(STRIPE_PK)

export default function BuyButton({ product }) {
  const { getToken } = useContext(AuthContext);

  const handleBuy = async () => {
    const stripe = await stripePromise
    const token = await getToken()

    const res = await fetch(`${API_URL}/orders?provider=stripe`, {
      method: 'POST',
      body: JSON.stringify({ product }),
      headers: {
        'Content-type': `application/json`,
        'Authorization': `Bearer ${token}`,
      }
    })
    const session = await res.json()

    const result = await stripe.redirectToCheckout({
      sessionId: session.id
    })
  }

  return (
    <>
      <button className={styles.buy} onClick={handleBuy}>
        Buy
      </button>
    </>
  )
}
