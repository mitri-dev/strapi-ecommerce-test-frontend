import { useContext } from 'react'
import { useRouter } from 'next/router'
import { formatPrice } from '../../utils/format'
import { fromImgToUrl, API_URL, BRAND_NAME } from '../../utils/urls'

import styles from '../../styles/Product.module.css'
import Head from 'next/head'
import BuyButton from '../../components/BuyButton'
import PaypalButton from '../../components/PaypalButton'

import AuthContext from '../../context/AuthContext'

const Product = ({ product }) => {
  const { user } = useContext(AuthContext);

  const router = useRouter()

  const redirectToLogin = () => {
    router.push('/login')
  }
  
  function zoomIn(e) {
    const magArea = document.getElementById('product-img-wrapper')
    const magImg = magArea.children[0]
    let clientX = e.clientX - magArea.offsetLeft
    let clientY = e.clientY - magArea.offsetTop

    let mWidht = magArea.offsetWidth
    let mHeigh = magArea.offsetHeight

    clientX= ((clientX / mWidht * 100) - 50)*-1
    clientY= ((clientY / mHeigh * 100) - 50)*-1
    console.log(clientX, clientY)

    magImg.style.transform = `translate(${clientX}%, ${clientY}%) scale(2)`
  }

  function onMouseOut() {
    const magArea = document.getElementById('product-img-wrapper')
    const magImg = magArea.children[0]
    magImg.style.transform = `translate(-${0}%, -${0}%) scale(1)`
  }

  function throttled(delay, fn) {
    let lastCall = 0;
    return function (...args) {
      const now = (new Date).getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return fn(...args);
    }
  }
  
  const onMouseMove = throttled(10, zoomIn);

  return (
    <div className={styles.wrapper}>
      <Head>        
        <meta http-equiv="Content-Type" content="text/html"/>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>{`${product.title} - ${BRAND_NAME}`}</title>
        {product.meta_description &&
          <meta name="description" content={product.meta_description} />
        }
      </Head>
      <div>
        <div id={'product-img-wrapper'} onMouseMove={onMouseMove} onMouseOut={onMouseOut} className={styles.product_img_wrapper}>
          <img src={fromImgToUrl(product.image)}/>
        </div>
      </div>
      <div>
        <h3 className={styles.product_title}>{product.title}</h3>
        <p className={styles.product_price}><b>${formatPrice(product.price)}</b></p>
        <p className={styles.product_description}>
          {product.description}
        </p>
        {!user &&
          <button className={styles.buy} onClick={redirectToLogin}>
            Login to Buy
          </button>
        }
        {user &&
          <div className={styles.payment_options}>
            <BuyButton product={product}/>
            <PaypalButton product={product}/>
          </div>
        }
      </div>

    </div>
  )
}

export async function getStaticProps({params: {slug}}) {
    // Retrieve all possible paths
    const product_res = await fetch(`${API_URL}/products/?slug=${slug}`)
    const found = await product_res.json()
  
    // Return to NextJS context
    return  {
      props: {
        product: found[0] // Using a query will result in returning an array
      }
    }
}

export async function getStaticPaths() {
  // Retrieve all possible paths
  const products_res = await fetch(`${API_URL}/products/`)
  const products = await products_res.json()

  // Return as Props
  return {
    paths: products.map(product => ({
      params: {
        slug: String(product.slug)
      }
    })),
    fallback: false // 404 error if no match
  }
}

export default Product