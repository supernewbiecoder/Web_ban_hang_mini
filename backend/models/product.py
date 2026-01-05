class Product:
    def __init__(self, name: str, price: float, description: str = "", supplier: str = "", batch_number: str = ""):
        self.name = name
        self.price = price
        self.description = description
        self.supplier = supplier
        self.batch_number = batch_number
    def to_dict(self)->dict:
        return{
            "name": self.name,
            "price": self.price,
            "description": self.description,
            "supplier": self.supplier,
            "batch_number": self.batch_number,
        }
    @staticmethod
    def from_dict(data: dict)->"Product":
        return Product(
            name=data.get("name"),
            price=data.get("price"),
            description=data.get("description",""),
            supplier=data.get("supplier",""),
            batch_number=data.get("batch_number","")
        )
# Schema validation cho product
create_product_schema={
    'type':'object',
    'properties':{
        'name':{'type':'string','minLength':1},
        'price':{'type':'number','minimum':0},
        'description':{'type':'string'},
        'supplier':{'type':'string'},
        'batch_number':{'type':'string'},
    },
    'required':['name','price','supplier','batch_number']
}

update_product_schema={
    'type':'object',
    'properties':{
        'name':{'type':'string','minLength':1},
        'price':{'type':'number','minimum':0},
        'description':{'type':'string'},
        'supplier':{'type':'string'},
        'batch_number':{'type':'string'},
    }
}