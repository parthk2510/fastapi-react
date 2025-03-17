import { ChakraProvider } from '@chakra-ui/react'
import { defaultSystem } from "@chakra-ui/react"
import Header from "./components/Header";
import Todos from "./pages/Todos";

function App() {

  return (
    <ChakraProvider value={defaultSystem}>
      <Todos />
    </ChakraProvider>
  )
}

export default App;
