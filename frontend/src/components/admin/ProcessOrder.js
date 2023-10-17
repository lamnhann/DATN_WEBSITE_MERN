import React, { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import Sidebar from './Sidebar';

import { useAlert } from 'react-alert';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, updateOrder, clearErrors } from '../../actions/orderActions'
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants';


const ProcessOrder = ({ match }) => {

    const [status, setStatus] = useState('');

    const alert = useAlert();
    const dispatch = useDispatch();

    const { loading, order = {} } = useSelector(state => state.orderDetails)
    const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus } = order
    const { error, isUpdated } = useSelector(state => state.order)
    
    const orderId = match.params.id;

    useEffect(() => {

        dispatch(getOrderDetails(orderId))

        if(error) {
            alert.error(error);
            dispatch(clearErrors())
        }

        if (isUpdated) {
            alert.success('Hoá đơn được cập nhật thành công');
            dispatch({ type: UPDATE_ORDER_RESET })
        }

    }, [dispatch, alert, error, isUpdated, orderId])

    const updateOrderHandler = (id) => {

        const formData = new FormData();
        formData.set('status', status);

        dispatch(updateOrder(id, formData));
    }

    const shippingDetails = shippingInfo && `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`
    const isPaid = paymentInfo && paymentInfo.status === 'succeeded' ? true : false;

    return (
      <Fragment>
        <MetaData title={`Xử lý hoá đơn # ${order && order._id}`} />
        <div className="row">
          <div className="col-12 col-md-2">
            <Sidebar />
          </div>

          <div className="col-12 col-md-10">
            <Fragment>
              {loading ? (
                <Loader />
              ) : (
                <div className="row d-flex justify-content-around">
                  <div className="col-12 col-lg-7 order-details">
                    <h1 className="my-5">Mã hoá đơn # {order && order._id}</h1>

                    <h4 className="mb-4">Thông tin giao hàng</h4>
                    <p>
                      <b>Họ tên:</b> {user && user.name}
                    </p>
                    <p>
                      <b>Số điện thoại:</b>{" "}
                      {shippingInfo && shippingInfo.phoneNo}
                    </p>
                    <p className="mb-4">
                      <b>Địa chỉ:</b>
                      {shippingDetails}
                    </p>
                    <p>
                      <b>Giá:</b> ${totalPrice}
                    </p>

                    <hr />

                    <h4 className="my-4">Thanh toán</h4>
                    <p className={isPaid ? "greenColor" : "redColor"}>
                      <b>{isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</b>
                    </p>

                    <h4 className="my-4">Mã Stripe:</h4>
                    <p>
                      <b>{paymentInfo && paymentInfo.id}</b>
                    </p>

                    <h4 className="my-4">Trạng thái hoá đơn:</h4>
                    <p
                      className={
                        order.orderStatus &&
                        String(order.orderStatus).includes("Delivered")
                          ? "greenColor"
                          : "redColor"
                      }
                    >
                      <b>{orderStatus}</b>
                    </p>

                    <h4 className="my-4">Vật phẩm trong hoá đơn:</h4>

                    <hr />
                    <div className="cart-item my-1">
                      {orderItems &&
                        orderItems.map((item) => (
                          <div key={item.product} className="row my-5">
                            <div className="col-4 col-lg-2">
                              <img
                                src={item.image}
                                alt={item.name}
                                height="45"
                                width="65"
                              />
                            </div>

                            <div className="col-5 col-lg-5">
                              <Link to={`/product/${item.product}`}>
                                {item.name}
                              </Link>
                            </div>

                            <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                              <p>${item.price}</p>
                            </div>

                            <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                              <p>{item.quantity} Món</p>
                            </div>
                          </div>
                        ))}
                    </div>
                    <hr />
                  </div>

                  <div className="col-12 col-lg-3 mt-5">
                    <h4 className="my-4">Trạng thái</h4>

                    <div className="form-group">
                      <select className="form-control" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Processing">Đang Xử lý</option>
                        <option value="Shipped">Đang vận chuyển</option>
                        <option value="Delivered">Đang giao hàng</option>
                      </select>
                    </div>

                    <button className="btn btn-primary btn-block" onClick={updateOrderHandler}>
                      Cập nhật trạng thái
                    </button>
                  </div>
                </div>
              )}
            </Fragment>
          </div>
        </div>
      </Fragment>
    );
}

export default ProcessOrder