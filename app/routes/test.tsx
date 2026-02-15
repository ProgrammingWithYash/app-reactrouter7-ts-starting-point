import type { Route } from "../+types/root"
import { Form } from "react-router"
import { db } from "~/db/index"
import { users } from "~/db/schema/schema"

export async function loader({request}: Route.LoaderArgs) {
	const allUsers = await db.select().from(users)
	return {users: allUsers}
}

export async function action({request}: Route.ActionArgs) {
	const formData = await request.formData()
	const name = formData.get("name") as string

	await db.insert(users).values({name})

	return {success: true, name}
}

export default function Test({loaderData}: Route.ComponentProps) {
	return <>
		<h1>It works!</h1>
		{loaderData.users.map(e => <>
			<div>{e.name}</div>
		</>)}

		<Form method="post">
			<input type="text" name="name"/>
			<button type="submit">Submit</button>
		</Form>
	</>
}
