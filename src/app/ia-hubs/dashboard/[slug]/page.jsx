import Display from "@/app/components/crudOperations/Display";
import { getData } from "@/app/api/api";

const Display1 = ({ params }) => {

  return (
    <>
    {/* {JSON.stringify(params.slug)} */}
    <Display endPoint={params.slug} />
    </>
  );
};

export default Display1
