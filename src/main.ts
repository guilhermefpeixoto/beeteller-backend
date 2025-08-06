import { app } from './infra/http/server'
import 'dotenv/config'; 

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

