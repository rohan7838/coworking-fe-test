const EllipseLoading = () => {
  return (
    <body class="flex justify-center items-center h-screen">
      <div class="bg-blue-600 p-2  w-4 h-4 rounded-full animate-bounce blue-circle delay-100"></div>
      <div class="bg-green-600 p-2 w-4 h-4 rounded-full animate-bounce green-circle delay-200"></div>
      <div class="bg-red-600 p-2  w-4 h-4 rounded-full animate-bounce red-circle delay-300"></div>
    </body>
  );
};

export default EllipseLoading;
