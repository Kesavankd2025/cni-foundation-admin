import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import OrdersLayer from "../components/OrdersLayer";

const OrdersPage = () => {
  return (
    <>
      <MasterLayout>
        <OrdersLayer />
      </MasterLayout>
    </>
  );
};

export default OrdersPage;
