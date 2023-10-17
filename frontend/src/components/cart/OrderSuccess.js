import React, {Fragment} from 'react'
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <Fragment>
      <div className="row justify-content-center">
        <div className="col-6 mt-5 text-center">
          <img
            className="my-5 img-fluid d-block mx-auto"
            src="https://freepngimg.com/thumb/success/6-2-success-png-image.png"
            alt="Order Success"
            width="200"
            height="200"
          />

          <h2>Đơn hàng được đặt thành công.</h2>

          <Link to="/order">Trở về thanh toán</Link>
        </div>
      </div>
    </Fragment>
  );
}

export default OrderSuccess