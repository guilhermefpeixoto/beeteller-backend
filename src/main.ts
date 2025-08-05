import { app } from './infra/http/server'


const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

