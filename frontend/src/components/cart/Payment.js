import React, { Fragment, useEffect } from 'react';

import MetaData from '../layout/MetaData';
import CheckoutSteps from './CheckoutSteps';
import { createOrder, clearErrors } from '../../actions/orderActions'

import { useAlert } from 'react-alert';
import { useDispatch, useSelector } from 'react-redux';

import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'

import axios from 'axios'

const options = {
    style: {
        base: {
            fonSize: '16px'
        },
        invalid: {
            color: '#9e2146'
        }
    }
}

const Payment = ({ history }) => {

    const alert = useAlert();
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.auth);
    const { cartItems, shippingInfo } = useSelector(state => state.cart);
    const { error } = useSelector(state => state.newOrder)
    
    useEffect(() => {

      if(error) {
        alert.error(error)
        dispatch(clearErrors())
      }

    }, [dispatch, alert, error])

    const order = {
      orderItems: cartItems,
      shippingInfo
    }

    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo'));
    if (orderInfo) {
      order.itemsPrice = orderInfo.itemsPrice
      order.shippingPrice = orderInfo.shippingPrice
      order.taxPrice = orderInfo.taxPrice
      order.totalPrice = orderInfo.totalPrice
    }

    const paymentData = {
      amount: Math.round(orderInfo.totalPrice * 100)
    }

    const submitHandler =  async (e) => {
      e.preventDefault();

      document.querySelector('#pay_btn').disabled = true;

      let res;

      try {

        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        }

        res = await axios.post('/api/v1/payment/process', paymentData, config)
        
        const clientSecret = res.data.client_secret;

        console.log(clientSecret);

        if(!stripe || !elements) {
          return;
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name: user.name,
              email: user.email
            }
          }
        })

        if(result.error) {
            alert.error(result.error.message);
            document.querySelector('#pay_btn').disabled = false;
        } else {

          // The payment is processed or not
          if(result.paymentIntent.status === 'succeeded') {

            //  TODO: New Order
            order.paymentInfo = {
              id: result.paymentIntent.id,
              status: result.paymentIntent.status
            }

            dispatch(createOrder(order))

            history.push('/success')
          } else {
            alert.error('Có một số vấn đề trong quá trình xử lý thanh toán')
          }
        }

      } catch (error) {
        document.querySelector('#pay_btn').disabled = false;
        alert.error(error.response.data.message)

        console.log(error.response.data);

      }
    }

    return (
      <Fragment>
        <MetaData title={"Thanh toán hoá đơn"} />

        <CheckoutSteps shipping confirmOrder payment />

        <div className="row wrapper">
          <div className="col-10 col-lg-5">
            <form className="shadow-lg" onClick={submitHandler}>
              <h1 className="mb-4">Thông tin thẻ</h1>
              <div className="form-group">
                <label htmlFor="card_num_field">Số thẻ</label>
                <CardNumberElement
                    type="text"
                    id="card_num_field"
                    className="form-control"
                    options={options}
                />
              </div>

              <div className="form-group">
                <label htmlFor="card_exp_field">Ngày hết hạn</label>
                <CardExpiryElement
                    type="text"
                    id="card_exp_field"
                    className="form-control"
                    options={options}
                />
              </div>

              <div className="form-group">
                <label htmlFor="card_cvc_field">Mã CVC</label>
                <CardCvcElement
                    type="text"
                    id="card_cvc_field"
                    className="form-control"
                    options={options}
                />
              </div>

              <button id="pay_btn" type="submit" className="btn btn-block py-3">
                    Thanh toán {` - ${orderInfo && orderInfo.totalPrice}`}
              </button>
            </form>
          </div>
        </div>
      </Fragment>
    );
}

export default Payment