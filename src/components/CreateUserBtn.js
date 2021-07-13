import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	Button,
	ControlLabel,
	Form,
	FormControl,
	FormGroup,
	Modal,
	Schema,
} from "rsuite";
import { auth, firestore } from "../misc/firebase";

const usersRef = firestore.collection("users");

const { StringType } = Schema.Types;

const model = Schema.Model({
	name: StringType().isRequired("required"),
	branch: StringType().isRequired("tell me"),
});

const INITIAL_VALUE = {
	name: "",
	branch: "",
};

const CreateUserBtn = ({ uid }) => {
	const [createdNewAccount, setCreatedNewAccount] = useState(false);
	const [show, setShow] = useState(true);
	const [formValue, setFormValue] = useState(INITIAL_VALUE);
	const [isLoading, setIsLoaing] = useState(false);
	const formRef = useRef();

	const onFormChange = useCallback((value) => {
		setFormValue(value);
	}, []);

	const onSubmit = () => {
		if (!formRef.current.check()) {
			return;
		}

		setIsLoaing(true);

		const newUserData = {
			...formValue,
			student: true,
		};

		usersRef
			.doc(String(uid))
			.set(newUserData)
			.then(() => {
				Alert.success("Account created", 4000);
			})
			.catch((error) => {
				Alert.error(error.message, 4000);
			});

		setFormValue(INITIAL_VALUE);
		setIsLoaing(false);
		setCreatedNewAccount(true);
	};

	const onHide = () => {
		if (auth.currentUser) {
			Promise.all([auth.currentUser.delete()]);
		} else {
			setShow(false);
		}
	};

	useEffect(() => {
		return () => {
			if (!createdNewAccount) {
				Promise.all([auth.currentUser.delete()]);
			}
		};
	}, [createdNewAccount]);

	return (
		<div>
			<Modal show={show} onHide={onHide}>
				<Modal.Header>
					<Modal.Title>Enter your details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form
						ref={formRef}
						onChange={onFormChange}
						formValue={formValue}
						model={model}
					>
						<FormGroup>
							<ControlLabel>name</ControlLabel>
							<FormControl name="name" />
						</FormGroup>

						<FormGroup>
							<ControlLabel>Branch</ControlLabel>
							<FormControl name="branch" />
						</FormGroup>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button
						block
						appearance="primary"
						onClick={onSubmit}
						disabled={isLoading}
					>
						Submit
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default CreateUserBtn;