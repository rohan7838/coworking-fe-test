import View from "@/app/components/crudOperations/View"

const Viewproducts = ({params}) => {
    // console.log(params)
    const objectKeyArray = Object.keys(params);
    const endPointArray = objectKeyArray.map((key)=>{
        return params[key]
    })

    const apiEndPoint = endPointArray.join("/")

  return (
    <>
    <View endPointWithId = {apiEndPoint}/></>
  )
}

export default Viewproducts