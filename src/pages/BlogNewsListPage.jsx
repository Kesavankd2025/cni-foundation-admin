
import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
// import Breadcrumb from "../components/Breadcrumb";
import Layer from "../components/BlogNewsListLayer";

const BlogNewsListPage = () => {
  return (
    <>
      <MasterLayout>
        {/* <Breadcrumb title="Blog / Latest News Management" /> */}
        <Layer />
      </MasterLayout>
    </>
  );
};
export default BlogNewsListPage;
