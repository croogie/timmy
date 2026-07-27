export function Component({ error }) {
  if (error) {
    console.log({ error });
  }

  return (
    <div>
      <h1>Error happened!</h1>
    </div>
  );
}
